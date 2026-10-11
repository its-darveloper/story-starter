#!/usr/bin/env python3
"""Read pack info from a local Sims 4 packs folder.

Usage:
  python3 tools/read_packs.py list   <packs_dir>
  python3 tools/read_packs.py worlds <packs_dir>
  python3 tools/read_packs.py search <packs_dir> <regex> [--pack EP01] [--limit 20]
  python3 tools/read_packs.py dump   <packs_dir> <out_dir>

Reads files on the user's own machine. Do not commit dumped game text to a public repo.
"""
import argparse
import os
import re
import struct
import sys
import zlib

STBL_TYPE = 0x220557DA


def read_index(path):
    """Return (file, entries) for a DBPF 2.x package. entries: (type, instance, pos, size, compression)."""
    f = open(path, "rb")
    h = f.read(96)
    if h[:4] != b"DBPF":
        raise ValueError("not a DBPF package: " + path)
    count = struct.unpack("<I", h[36:40])[0]
    index_pos = struct.unpack("<I", h[64:68])[0]
    f.seek(index_pos)
    flags = struct.unpack("<I", f.read(4))[0]
    const = [struct.unpack("<I", f.read(4))[0] if flags & (1 << b) else None for b in range(3)]
    entries = []
    for _ in range(count):
        vals = [c if c is not None else struct.unpack("<I", f.read(4))[0] for c in const]
        inst_lo, pos, size, _mem = struct.unpack("<IIII", f.read(16))
        comp, _unk = struct.unpack("<HH", f.read(4))
        entries.append((vals[0], (vals[2] << 32) | inst_lo, pos, size & 0x7FFFFFFF, comp))
    return f, entries


def refpack_decompress(b):
    """EA RefPack (QFS) decompression, used for compression codes 0xFFFE/0xFFFF."""
    flags = b[0]
    width = 4 if flags & 0x80 else 3
    i = 2
    if flags & 0x01:
        i += width
    size = int.from_bytes(b[i:i + width], "big")
    i += width
    out = bytearray()
    while i < len(b) and len(out) < size:
        c = b[i]
        i += 1
        if c < 0x80:
            b1 = b[i]; i += 1
            plain, copy, off = c & 3, ((c & 0x1C) >> 2) + 3, ((c & 0x60) << 3) + b1 + 1
        elif c < 0xC0:
            b1, b2 = b[i], b[i + 1]; i += 2
            plain, copy, off = (b1 >> 6) & 3, (c & 0x3F) + 4, ((b1 & 0x3F) << 8) + b2 + 1
        elif c < 0xE0:
            b1, b2, b3 = b[i], b[i + 1], b[i + 2]; i += 3
            plain, copy = c & 3, ((c & 0x0C) << 6) + b3 + 5
            off = ((c & 0x10) << 12) + (b1 << 8) + b2 + 1
        elif c < 0xFC:
            plain, copy, off = ((c & 0x1F) << 2) + 4, 0, 0
        else:
            plain, copy, off = c & 3, 0, 0
        out += b[i:i + plain]
        i += plain
        for _ in range(copy):
            out.append(out[-off])
    return bytes(out)


def read_resource(f, pos, size, comp):
    f.seek(pos)
    raw = f.read(size)
    if comp in (0xFFFE, 0xFFFF):
        return refpack_decompress(raw)
    if comp == 0x5A42:
        return zlib.decompress(raw)
    return raw


def read_strings(path):
    """Return a list of (key, text) from a Strings_*.package file."""
    f, entries = read_index(path)
    out = []
    for t, _inst, pos, size, comp in entries:
        if t != STBL_TYPE:
            continue
        d = read_resource(f, pos, size, comp)
        if d[:4] != b"STBL":
            continue
        n = struct.unpack("<Q", d[7:15])[0]
        off = 21
        for _ in range(n):
            if off + 7 > len(d):
                break
            key = struct.unpack("<I", d[off:off + 4])[0]
            ln = struct.unpack("<H", d[off + 5:off + 7])[0]
            out.append((key, d[off + 7:off + 7 + ln].decode("utf-8", "replace")))
            off += 7 + ln
    f.close()
    return out


def pack_dirs(root):
    return sorted(d for d in os.listdir(root)
                  if re.fullmatch(r"(EP|GP|SP|FP)\d+", d) and os.path.isdir(os.path.join(root, d)))


def cmd_list(root):
    for d in pack_dirs(root):
        print(d)


def cmd_worlds(root):
    for d in pack_dirs(root):
        wdir = os.path.join(root, d, "Worlds", "Areas")
        worlds = sorted(w[:-6] for w in os.listdir(wdir)) if os.path.isdir(wdir) else []
        print(d + ":", ", ".join(worlds) or "(no worlds)")


def cmd_search(root, pattern, pack=None, limit=20):
    rx = re.compile(pattern, re.I)
    for d in ([pack] if pack else pack_dirs(root)):
        p = os.path.join(root, d, "Strings_ENG_US.package")
        if not os.path.exists(p):
            continue
        hits = [s for _k, s in read_strings(p) if rx.search(s)]
        print("[%s] %d matches" % (d, len(hits)))
        for s in hits[:limit]:
            print("   -", s.replace("\n", " ")[:140])


def cmd_dump(root, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    for d in pack_dirs(root):
        p = os.path.join(root, d, "Strings_ENG_US.package")
        if not os.path.exists(p):
            continue
        with open(os.path.join(out_dir, d + ".tsv"), "w", encoding="utf-8") as fh:
            for k, s in read_strings(p):
                fh.write("0x%08X\t%s\n" % (k, s.replace("\t", " ").replace("\n", "\\n")))
        print("wrote", d)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("command", choices=["list", "worlds", "search", "dump"])
    ap.add_argument("root")
    ap.add_argument("arg", nargs="?")
    ap.add_argument("--pack")
    ap.add_argument("--limit", type=int, default=20)
    a = ap.parse_args()
    if a.command == "list":
        cmd_list(a.root)
    elif a.command == "worlds":
        cmd_worlds(a.root)
    elif a.command == "search":
        if not a.arg:
            sys.exit("search needs a regex")
        cmd_search(a.root, a.arg, a.pack, a.limit)
    else:
        if not a.arg:
            sys.exit("dump needs an output directory")
        cmd_dump(a.root, a.arg)


if __name__ == "__main__":
    main()
