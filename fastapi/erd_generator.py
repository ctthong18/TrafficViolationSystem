from eralchemy import render_er
from app.models import Base

render_er(Base, 'erd.png')
