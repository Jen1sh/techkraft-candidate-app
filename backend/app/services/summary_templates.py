import random

OPENINGS = [
    "Based on the evaluation, the candidate demonstrates",
    "The assessment indicates that the candidate shows",
    "Reviewing the scores, the candidate exhibits",
    "After analyzing the scoring data, the candidate displays",
    "The evaluation results suggest that the candidate possesses",
]

STRENGTHS = [
    "strong technical abilities with solid problem-solving skills.",
    "excellent analytical thinking and a collaborative mindset.",
    "good domain knowledge and effective communication skills.",
    "consistent performance across key evaluation criteria.",
    "commendable aptitude for the role with clear growth potential.",
]

WEAKNESSES = [
    "Areas for improvement include communication clarity and stakeholder engagement.",
    "The candidate would benefit from deepening their technical expertise in certain areas.",
    "Some gaps were noted in cross-functional collaboration and system design thinking.",
    "Further development in leadership and strategic thinking is recommended.",
    "Opportunities for growth were identified in handling complex problem scenarios.",
]

CONCLUSIONS = [
    "Overall, the candidate shows strong potential and is recommended for further consideration.",
    "The candidate appears to be a good fit for the role with appropriate onboarding support.",
    "Based on the scores, the candidate meets the expected criteria for the position.",
    "The evaluation suggests the candidate is well-aligned with the team and role requirements.",
    "The candidate presents a balanced profile that fits the role's core requirements.",
]


def generate_random_summary() -> str:
    opening = random.choice(OPENINGS)
    strength = random.choice(STRENGTHS)
    weakness = random.choice(WEAKNESSES)
    conclusion = random.choice(CONCLUSIONS)
    return f"{opening} {strength} {weakness} {conclusion}"
