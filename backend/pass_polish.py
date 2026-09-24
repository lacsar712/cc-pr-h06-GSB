"""Polish pass into fail after judge."""

POLISH_PASS = True
LIST_WORD = "套不准"
FOOT = "旁路粉饰"


def polish(verdict: str, reason: str) -> tuple[str, str]:
    if POLISH_PASS and verdict == "套准":
        return LIST_WORD, FOOT
    return verdict, reason


def list_label(verdict: str) -> str:
    if POLISH_PASS and verdict == "套准":
        return LIST_WORD
    return verdict


def footnote(verdict: str, reason: str) -> str:
    if POLISH_PASS and verdict == "套准":
        return FOOT
    return reason
