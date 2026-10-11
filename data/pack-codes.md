# Sims 4 pack code → name table

Built from the learner's local folder `~/Documents/The Sims 4 Packs/` (30 pack folders).
Draft: names were matched by what is inside each folder, not read directly from a name field.

Confidence key
- **High** — world/area names inside the folder match the pack's known world.
- **Medium** — matched from item/interaction text in `Strings_ENG_US.package` plus pack code.
- **Low** — best guess; confirm before relying on it.

## Expansion packs (EP)

| Code | Pack | Evidence | Confidence |
|---|---|---|---|
| EP01 | Get to Work | AlienWorld, ScienceLab, Retails, CivicCenter areas | High |
| EP02 | Get Together | Windenburg-style areas: ChaletGarden, OldTown, Island, Business | High |
| EP03 | City Living | ArtsQuarter, fashionDistrict, Uptown, Docklands, CentralPark (San Myshuno) | High |
| EP04 | Cats & Dogs | Coastal, Harbor, TownSquare (Brindleton Bay) | High |
| EP05 | Seasons | No worlds; weather/freezing, flowers, polar bear strings | High |
| EP08 | Discover University | ArtsCampus, STEMCampus, CollegeTown | High |
| EP10 | Snowy Escape | BaseCamp, MountainTown, SummitTown, TouristTown | High |
| EP11 | Cottage Living | Forest, Rural, Village | High |
| EP13 | Growing Together | AcrossTheBay, ThePark, WaterFront (San Sequoia) | Medium |
| EP15 | For Rent | RiverDelta, Urban (Tomarang) | High |
| EP16 | Lovestruck | CentralSquare, Downtown, Suburban | High |

## Game packs (GP)

| Code | Pack | Evidence | Confidence |
|---|---|---|---|
| GP02 | Spa Day | foot massage, incense, aromatherapy strings | High |
| GP03 | Dine Out | Simstagram, flavor profiles strings | High |
| GP04 | Vampires | VampireWorld area | High |
| GP05 | Parenthood | journal memories / snooping strings | Medium |
| GP08 | Realm of Magic | MagicRealm, Village areas | High |

## Free pack (FP)

| Code | Pack | Evidence | Confidence |
|---|---|---|---|
| FP01 | Holiday Celebration Pack | code only; no readable strings | Medium |

## Stuff packs and kits (SP)

| Code | Pack | Evidence | Confidence |
|---|---|---|---|
| SP02 | Perfect Patio Stuff | "Kiss the Cook", backyard strings | Medium |
| SP06 | Romantic Garden Stuff | coin-in-fountain interaction | Medium |
| SP08 | Backyard Stuff | watching birds, slides | Medium |
| SP12 | Toddler Stuff | ball pit, toddler slide, tunnels | High |
| SP13 | Laundry Day Stuff | filthy laundry, appliances | High |
| SP14 | My First Pet Stuff | feeding a rodent | High |
| SP16 | Tiny Living Stuff | Murphy bed, micro home | High |
| SP18 | Paranormal Stuff | paranormal investigator gig, specter | High |
| SP23 | Courtyard Oasis Kit | sandstone ceiling, design accents | Low |
| SP29 | unknown (vine/ivy curtains, wall decor kit) | decor text only | Low |
| SP40 | Greenhouse-themed kit (pavers, glass panels) | "Greenhouse Pavers" | Low |
| SP43 | Book/bookshelf-themed kit | bookshelf strings | Low |
| SP46 | Cooking-themed pack (pizza, meal prep) | "Curious Pizza", "Prepped Ingredients" | Low |

## Not present in this folder
Codes missing from the folder (e.g., EP06, EP07, EP09, EP12, EP14, GP01, GP06, GP07, GP09–GP12) are packs the player either does not have installed here or does not own. The folder list is the owned-pack list.

## Fast method for new packs
1. `ls` the packs folder: each folder name is the code.
2. Match code to this table.
3. For an unknown code, run `ls <code>/Worlds/Areas` (packs that add worlds), then read `Version.ini` (plain text).
4. If no worlds, skim readable strings in `Strings_ENG_US.package` for interaction/item names.
