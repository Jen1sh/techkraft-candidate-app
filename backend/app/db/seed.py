from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.models.candidate import Candidate, CandidateStatus
from app.db.models.score import Score
from app.db.models.user import Role, User

SEED_USERS = [
    {
        "name": "Admin User",
        "email": "admin@techcraft.com",
        "password": "password123",
        "role": Role.ADMIN,
    },
    {
        "name": "Reviewer User",
        "email": "reviewer@techcraft.com",
        "password": "password123",
        "role": Role.REVIEWER,
    },
]

SEED_CANDIDATES = [
    {"name": "Alice Johnson",      "email": "alice.johnson@email.com",    "role_applied": "Software Engineer",           "status": CandidateStatus.NEW,      "skills": ["Python", "FastAPI", "SQL"],                          "internal_notes": None},
    {"name": "Bob Smith",          "email": "bob.smith@email.com",        "role_applied": "Frontend Developer",          "status": CandidateStatus.REVIEWED, "skills": ["React", "TypeScript", "CSS"],                       "internal_notes": "Strong portfolio"},
    {"name": "Carol Williams",     "email": "carol.w@email.com",          "role_applied": "Data Scientist",              "status": CandidateStatus.HIRED,    "skills": ["Python", "ML", "SQL", "Statistics"],                  "internal_notes": "Accepted offer"},
    {"name": "David Brown",        "email": "david.brown@email.com",      "role_applied": "Backend Engineer",            "status": CandidateStatus.REJECTED, "skills": ["Go", "PostgreSQL", "Docker"],                        "internal_notes": "Lacked system design experience"},
    {"name": "Eve Davis",          "email": "eve.davis@email.com",        "role_applied": "Product Manager",             "status": CandidateStatus.NEW,      "skills": ["Agile", "Roadmapping", "Analytics"],                  "internal_notes": None},
    {"name": "Frank Miller",       "email": "frank.miller@email.com",     "role_applied": "DevOps Engineer",             "status": CandidateStatus.REVIEWED, "skills": ["AWS", "Kubernetes", "Terraform", "CI/CD"],           "internal_notes": "Scheduling technical round"},
    {"name": "Grace Wilson",       "email": "grace.wilson@email.com",     "role_applied": "Full Stack Developer",        "status": CandidateStatus.HIRED,    "skills": ["React", "Node.js", "MongoDB", "TypeScript"],          "internal_notes": "Start date confirmed"},
    {"name": "Henry Taylor",       "email": "henry.taylor@email.com",     "role_applied": "QA Engineer",                 "status": CandidateStatus.REJECTED, "skills": ["Selenium", "Cypress", "Python"],                     "internal_notes": "Did not meet automation expectations"},
    {"name": "Ivy Anderson",       "email": "ivy.anderson@email.com",     "role_applied": "Software Engineer",           "status": CandidateStatus.NEW,      "skills": ["Java", "Spring", "SQL", "Kafka"],                    "internal_notes": None},
    {"name": "Jack Thomas",       "email": "jack.thomas@email.com",      "role_applied": "Mobile Developer",            "status": CandidateStatus.REVIEWED, "skills": ["Kotlin", "Jetpack Compose", "Firebase"],              "internal_notes": "Phone screen passed"},
    {"name": "Karen Jackson",     "email": "karen.jackson@email.com",    "role_applied": "Data Engineer",               "status": CandidateStatus.NEW,      "skills": ["Spark", "Airflow", "Python", "Snowflake"],            "internal_notes": None},
    {"name": "Leo White",         "email": "leo.white@email.com",        "role_applied": "UX Designer",                 "status": CandidateStatus.REVIEWED, "skills": ["Figma", "User Research", "Prototyping"],              "internal_notes": "Design exercise sent"},
    {"name": "Mia Harris",        "email": "mia.harris@email.com",       "role_applied": "Backend Engineer",            "status": CandidateStatus.HIRED,    "skills": ["Python", "Django", "PostgreSQL", "Redis"],            "internal_notes": "Offer accepted"},
    {"name": "Noah Martin",       "email": "noah.martin@email.com",      "role_applied": "ML Engineer",                 "status": CandidateStatus.REJECTED, "skills": ["TensorFlow", "PyTorch", "Python", "NLP"],             "internal_notes": "Overqualified for role"},
    {"name": "Olivia Garcia",     "email": "olivia.garcia@email.com",    "role_applied": "Frontend Developer",          "status": CandidateStatus.NEW,      "skills": ["Vue.js", "JavaScript", "Sass", "GraphQL"],            "internal_notes": None},
]

SEED_SCORES = [
    # Bob Smith (reviewed) — Frontend Developer
    {"candidate_email": "bob.smith@email.com",    "category": "Technical Skills",  "score": 4, "note": "Solid React knowledge"},
    {"candidate_email": "bob.smith@email.com",    "category": "Communication",     "score": 3, "note": "Average verbal clarity"},
    {"candidate_email": "bob.smith@email.com",    "category": "Problem Solving",   "score": 4, "note": "Good approach to challenges"},
    {"candidate_email": "bob.smith@email.com",    "category": "Culture Fit",       "score": 4, "note": "Team player"},
    # Carol Williams (hired) — Data Scientist
    {"candidate_email": "carol.w@email.com",      "category": "Technical Skills",  "score": 5, "note": "Exceptional ML knowledge"},
    {"candidate_email": "carol.w@email.com",      "category": "Communication",     "score": 5, "note": "Explains complex concepts clearly"},
    {"candidate_email": "carol.w@email.com",      "category": "Problem Solving",   "score": 5, "note": "Outstanding analytical thinking"},
    {"candidate_email": "carol.w@email.com",      "category": "Culture Fit",       "score": 5, "note": "Perfect team fit"},
    {"candidate_email": "carol.w@email.com",      "category": "Experience",        "score": 4, "note": "5 years relevant experience"},
    # David Brown (rejected) — Backend Engineer
    {"candidate_email": "david.brown@email.com",  "category": "Technical Skills",  "score": 3, "note": "Average Go proficiency"},
    {"candidate_email": "david.brown@email.com",  "category": "Communication",     "score": 2, "note": "Struggled to articulate"},
    {"candidate_email": "david.brown@email.com",  "category": "Problem Solving",   "score": 2, "note": "Weak system design"},
    {"candidate_email": "david.brown@email.com",  "category": "Culture Fit",       "score": 3, "note": "Adequate"},
    # Frank Miller (reviewed) — DevOps Engineer
    {"candidate_email": "frank.miller@email.com", "category": "Technical Skills",  "score": 4, "note": "Strong AWS and K8s"},
    {"candidate_email": "frank.miller@email.com", "category": "Communication",     "score": 4, "note": "Clear and concise"},
    {"candidate_email": "frank.miller@email.com", "category": "Problem Solving",   "score": 3, "note": "Average troubleshooting"},
    {"candidate_email": "frank.miller@email.com", "category": "Culture Fit",       "score": 4, "note": "Good cultural alignment"},
    {"candidate_email": "frank.miller@email.com", "category": "Experience",        "score": 4, "note": "Solid work history"},
    # Grace Wilson (hired) — Full Stack Developer
    {"candidate_email": "grace.wilson@email.com", "category": "Technical Skills",  "score": 5, "note": "Full stack mastery"},
    {"candidate_email": "grace.wilson@email.com", "category": "Communication",     "score": 4, "note": "Great presentation"},
    {"candidate_email": "grace.wilson@email.com", "category": "Problem Solving",   "score": 5, "note": "Excellent problem solver"},
    {"candidate_email": "grace.wilson@email.com", "category": "Culture Fit",       "score": 5, "note": "Seamless team fit"},
    # Henry Taylor (rejected) — QA Engineer
    {"candidate_email": "henry.taylor@email.com", "category": "Technical Skills",  "score": 2, "note": "Limited automation experience"},
    {"candidate_email": "henry.taylor@email.com", "category": "Communication",     "score": 3, "note": "Acceptable"},
    {"candidate_email": "henry.taylor@email.com", "category": "Problem Solving",   "score": 2, "note": "Struggled with test scenarios"},
    {"candidate_email": "henry.taylor@email.com", "category": "Culture Fit",       "score": 3, "note": "Neutral"},
    # Jack Thomas (reviewed) — Mobile Developer
    {"candidate_email": "jack.thomas@email.com",  "category": "Technical Skills",  "score": 4, "note": "Strong Kotlin skills"},
    {"candidate_email": "jack.thomas@email.com",  "category": "Communication",     "score": 4, "note": "Good communicator"},
    {"candidate_email": "jack.thomas@email.com",  "category": "Problem Solving",   "score": 3, "note": "Adequate"},
    {"candidate_email": "jack.thomas@email.com",  "category": "Culture Fit",       "score": 4, "note": "Good energy"},
    # Leo White (reviewed) — UX Designer
    {"candidate_email": "leo.white@email.com",    "category": "Technical Skills",  "score": 3, "note": "Competent with Figma"},
    {"candidate_email": "leo.white@email.com",    "category": "Communication",     "score": 5, "note": "Excellent presentation skills"},
    {"candidate_email": "leo.white@email.com",    "category": "Problem Solving",   "score": 4, "note": "User-centric approach"},
    {"candidate_email": "leo.white@email.com",    "category": "Culture Fit",       "score": 5, "note": "Great collaborator"},
    {"candidate_email": "leo.white@email.com",    "category": "Experience",        "score": 4, "note": "Strong portfolio"},
    # Mia Harris (hired) — Backend Engineer
    {"candidate_email": "mia.harris@email.com",   "category": "Technical Skills",  "score": 5, "note": "Expert Python and Django"},
    {"candidate_email": "mia.harris@email.com",   "category": "Communication",     "score": 4, "note": "Clear documentation"},
    {"candidate_email": "mia.harris@email.com",   "category": "Problem Solving",   "score": 5, "note": "Excellent debugging skills"},
    {"candidate_email": "mia.harris@email.com",   "category": "Culture Fit",       "score": 5, "note": "Highly collaborative"},
    {"candidate_email": "mia.harris@email.com",   "category": "Experience",        "score": 4, "note": "6 years experience"},
    # Noah Martin (rejected) — ML Engineer
    {"candidate_email": "noah.martin@email.com",  "category": "Technical Skills",  "score": 5, "note": "Deep ML expertise"},
    {"candidate_email": "noah.martin@email.com",  "category": "Communication",     "score": 3, "note": "Too technical for stakeholders"},
    {"candidate_email": "noah.martin@email.com",  "category": "Problem Solving",   "score": 4, "note": "Strong analytical skills"},
    {"candidate_email": "noah.martin@email.com",  "category": "Culture Fit",       "score": 2, "note": "Did not align with team values"},
    {"candidate_email": "noah.martin@email.com",  "category": "Experience",        "score": 5, "note": "10 years experience"},
    # Alice Johnson (new — scored in progress)
    {"candidate_email": "alice.johnson@email.com","category": "Technical Skills",  "score": 4, "note": "Strong Python basics"},
    {"candidate_email": "alice.johnson@email.com","category": "Communication",     "score": 3, "note": "Needs improvement"},
    # Eve Davis (new — scored in progress)
    {"candidate_email": "eve.davis@email.com",    "category": "Technical Skills",  "score": 3, "note": "Fair understanding"},
    {"candidate_email": "eve.davis@email.com",    "category": "Culture Fit",       "score": 4, "note": "Good vibe"},
]


async def seed_users(db: AsyncSession) -> None:
    for user_data in SEED_USERS:
        result = await db.execute(select(User).where(User.email == user_data["email"]))
        existing = result.scalar_one_or_none()
        if existing is not None:
            continue
        user = User(
            name=user_data["name"],
            email=user_data["email"],
            password=hash_password(user_data["password"]),
            role=user_data["role"],
        )
        db.add(user)
    await db.commit()


async def seed_candidates(db: AsyncSession) -> None:
    for data in SEED_CANDIDATES:
        result = await db.execute(select(Candidate).where(Candidate.email == data["email"]))
        existing = result.scalar_one_or_none()
        if existing is not None:
            continue
        candidate = Candidate(
            name=data["name"],
            email=data["email"],
            role_applied=data["role_applied"],
            status=data["status"],
            skills=data["skills"],
            internal_notes=data["internal_notes"],
        )
        db.add(candidate)
    await db.commit()


async def seed_scores(db: AsyncSession) -> None:
    reviewer_result = await db.execute(select(User).where(User.email == "reviewer@techcraft.com"))
    reviewer = reviewer_result.scalar_one_or_none()
    if reviewer is None:
        return

    for data in SEED_SCORES:
        cand_result = await db.execute(select(Candidate).where(Candidate.email == data["candidate_email"]))
        candidate = cand_result.scalar_one_or_none()
        if candidate is None:
            continue

        existing = await db.execute(
            select(Score).where(
                Score.candidate_id == candidate.id,
                Score.category == data["category"],
                Score.reviewer_id == reviewer.id,
            )
        )
        if existing.scalar_one_or_none() is not None:
            continue

        score = Score(
            candidate_id=candidate.id,
            category=data["category"],
            score=data["score"],
            reviewer_id=reviewer.id,
            note=data["note"],
        )
        db.add(score)
    await db.commit()
