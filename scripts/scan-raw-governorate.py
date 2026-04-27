"""
Scan all .tsx/.ts files in apps/web/src for raw governorate display patterns.

Detects places where a governorate value (from props, item, listing, etc.)
is rendered in JSX WITHOUT being wrapped in resolveLocationLabel() or
resolveOmanLocationLabels().

Patterns detected:
  1. {something.governorate} in JSX (not inside resolveLocationLabel())
  2. {something.governorate} used in template literals / string concat
  3. governorate passed as display text (not as a prop to a component that resolves it)
"""

import os
import re
import sys
from pathlib import Path

WEB_SRC = Path(__file__).resolve().parent.parent / "apps" / "web" / "src"

# Files that define or export resolveLocationLabel — skip them
SKIP_FILES = {"location-data.ts", "location-data.tsx"}

# Patterns where governorate is displayed RAW (not wrapped in resolveLocationLabel)
# We look for JSX expressions like {foo.governorate} or {foo.governorate || ...}
# that are NOT inside resolveLocationLabel(...)

# Pattern: something.governorate used in JSX text (between > and <)
# or inside {} without resolveLocationLabel wrapping
RAW_DISPLAY_RE = re.compile(
    r"""
    # Match {expr.governorate} or {expr.governorate ...} in JSX
    # but NOT resolveLocationLabel(expr.governorate
    (?<!resolveLocationLabel\()
    (?<!resolveOmanLocationLabels\()
    (\w+)\.governorate
    """,
    re.VERBOSE,
)

# Lines that are just passing governorate as a prop to a component
# e.g. governorate={item.governorate} — these are OK if the receiving component resolves
PROP_PASS_RE = re.compile(r"^\s*governorate=\{")

# Lines that are API params or state setting — not display
NON_DISPLAY_PATTERNS = [
    r"\.governorate\s*=",           # assignment
    r"set\w*\(.*governorate",       # setState calls
    r"p\.governorate\s*=",          # API param building
    r"p\[.governorate.\]",          # API param building
    r"params.*governorate",         # API params
    r"interface\s",                 # type definitions
    r"governorate\s*\??\s*:",       # type/interface field definitions
    r"\.governorate\s*\|\|\s*''",   # default empty string (form init)
    r"form\.governorate",           # form state
    r"set\('governorate'",          # form setter
    r"governorate.*onChange",       # form onChange handler
    r"getGovernorates\(",           # calling helper
    r"getCities\(",                 # calling helper
    r"governorateOptions",          # options variable
    r"selectedGov",                 # selected state
    r"import\s",                    # import lines
    r"export\s",                    # export lines
    r"//",                          # comments
    r"/\*",                         # comments
    r"console\.",                   # logging
    r"governorate\s*&&\s*\(",       # conditional render wrapper (check the inner part separately)
    r"resolveLocationLabel",        # already resolved
    r"resolveOmanLocationLabels",   # already resolved
    r"governorate\s*\?\s*`",       # already handled in template
]

NON_DISPLAY_RES = [re.compile(p) for p in NON_DISPLAY_PATTERNS]

# Components known to internally resolve governorate
RESOLVING_COMPONENTS = {
    "VehicleCard", "GenericListingCard", "UnifiedCard", "ListingCard",
}

def is_prop_to_resolving_component(line: str, lines: list, idx: int) -> bool:
    """Check if this governorate= prop is passed to a component that resolves internally."""
    # Look backwards for the opening tag
    for i in range(idx, max(idx - 5, -1), -1):
        for comp in RESOLVING_COMPONENTS:
            if f"<{comp}" in lines[i]:
                return True
    return False

def is_non_display(line: str) -> bool:
    """Check if line is NOT a display context (API, state, type def, etc.)."""
    for pat in NON_DISPLAY_RES:
        if pat.search(line):
            return True
    return False

def scan_file(filepath: Path) -> list:
    """Scan a single file for raw governorate displays. Returns list of (line_num, line_text)."""
    if filepath.name in SKIP_FILES:
        return []

    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception:
        return []

    lines = content.splitlines()
    issues = []

    for idx, line in enumerate(lines):
        stripped = line.strip()

        # Skip empty lines
        if not stripped:
            continue

        # Must contain .governorate to be relevant
        if ".governorate" not in stripped:
            continue

        # Skip non-display contexts
        if is_non_display(stripped):
            continue

        # Check if it's a prop pass to a resolving component
        if PROP_PASS_RE.search(stripped):
            if is_prop_to_resolving_component(stripped, lines, idx):
                continue

        # Check for raw display pattern
        match = RAW_DISPLAY_RE.search(stripped)
        if match:
            # Double check it's not already wrapped
            # Find all occurrences in the line
            for m in RAW_DISPLAY_RE.finditer(stripped):
                start = m.start()
                # Check if resolveLocationLabel appears before this match on the same line
                prefix = stripped[:start]
                if "resolveLocationLabel" in prefix or "resolveOmanLocationLabels" in prefix:
                    continue
                issues.append((idx + 1, stripped))
                break

    return issues

def main():
    print(f"Scanning: {WEB_SRC}")
    print("=" * 80)

    total_issues = 0
    files_with_issues = 0

    for ext in ("*.tsx", "*.ts"):
        for filepath in sorted(WEB_SRC.rglob(ext)):
            rel = filepath.relative_to(WEB_SRC)
            issues = scan_file(filepath)
            if issues:
                files_with_issues += 1
                total_issues += len(issues)
                print(f"\n📁 {rel}")
                for line_num, line_text in issues:
                    print(f"   L{line_num}: {line_text[:120]}")

    print("\n" + "=" * 80)
    if total_issues == 0:
        print("✅ No raw governorate displays found!")
    else:
        print(f"⚠️  Found {total_issues} potential raw governorate display(s) in {files_with_issues} file(s)")

    return 1 if total_issues > 0 else 0

if __name__ == "__main__":
    sys.exit(main())
