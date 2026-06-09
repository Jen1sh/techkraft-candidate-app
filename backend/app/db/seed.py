from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.models.candidate import Candidate, CandidateStatus
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
