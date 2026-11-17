from pydantic import BaseModel, Field
from typing import List, Optional

class CardItem(BaseModel):
    """
    Represents raw OCR data extracted from a single Best 50 card.
    Note: Following CLAUDE.md guidelines, this service only returns raw visual facts
    and confidence scores. It does NOT compute play rating or match against chart constants.
    """
    rank: int = Field(..., description="Rank of the play card from 1 to 50")
    title_raw: str = Field(..., description="Raw detected song title from OCR")
    score: int = Field(..., description="Cleaned integer score (e.g. 9900167)")
    score_formatted: str = Field(..., description="Raw formatted score string as detected on card")
    grade: str = Field(..., description="Detected score grade (EX+, EX, AA, A, B, C, D, PM)")
    lamp: str = Field(..., description="Detected clear lamp (pure_memory, full_recall, normal_clear, easy_clear, hard_clear, lost)")
    level_str: Optional[str] = Field(None, description="Printed difficulty level label (e.g. 11, 11+, 10)")
    printed_potential: Optional[float] = Field(None, description="Individual play rating printed on the card")
    confidence: float = Field(..., description="Average OCR confidence score between 0.0 and 1.0")
    row: int = Field(..., description="0-indexed row position (0 to 9)")
    col: int = Field(..., description="0-indexed column position (0 to 4)")

class Best50Response(BaseModel):
    """
    Structured response for the 5x10 Arcaea Best 50 screenshot parsing.
    """
    success: bool
    nickname: Optional[str] = Field(None, description="Player nickname detected in the header banner")
    generated_date: Optional[str] = Field(None, description="Screenshot generation date (YYYY/MM/DD)")
    printed_potential: Optional[float] = Field(None, description="Overall profile potential printed in the header")
    potential_stars: Optional[str] = Field(None, description="Potential star icons (e.g. ★★)")
    total_cards: int = Field(..., description="Number of successfully parsed cards (normally 50)")
    cards: List[CardItem] = Field(default_factory=list, description="Array of 50 play cards sorted by rank")
    average_confidence: float = Field(..., description="Mean OCR confidence across all detected tokens")
