"""drop resume parsing columns

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-26 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('resumes', 'raw_text')
    op.drop_column('resumes', 'parsed_sections')


def downgrade() -> None:
    op.add_column('resumes', sa.Column('parsed_sections', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('resumes', sa.Column('raw_text', sa.Text(), nullable=True))
