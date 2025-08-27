from sqlalchemy import Column, Integer, String, Text
from database import Base

# Object Relational Mapping (ORM) for Survey
class Survey(Base):
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, unique=True, nullable=False)
    generated_json = Column(Text, nullable=False)
