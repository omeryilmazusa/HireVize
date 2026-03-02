"""add application profile fields

Revision ID: a1b2c3d4e5f6
Revises: feceeec7cb5a
Create Date: 2026-02-26 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'feceeec7cb5a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename name → first_name, add last_name
    op.alter_column('users', 'name', new_column_name='first_name')
    op.add_column('users', sa.Column('last_name', sa.String(length=255), server_default='', nullable=False))

    # Replace phone (String) with phones (JSONB array)
    op.drop_column('users', 'phone')
    op.add_column('users', sa.Column('phones', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True))

    # Add new JSONB columns
    op.add_column('users', sa.Column('addresses', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True))
    op.add_column('users', sa.Column('candidate_answers', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=True))
    op.add_column('users', sa.Column('eeo', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=True))
    op.add_column('users', sa.Column('veteran_status', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=True))
    op.add_column('users', sa.Column('disability_status', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'disability_status')
    op.drop_column('users', 'veteran_status')
    op.drop_column('users', 'eeo')
    op.drop_column('users', 'candidate_answers')
    op.drop_column('users', 'addresses')

    # Restore phone column
    op.drop_column('users', 'phones')
    op.add_column('users', sa.Column('phone', sa.String(length=50), nullable=True))

    # Rename first_name back to name, drop last_name
    op.drop_column('users', 'last_name')
    op.alter_column('users', 'first_name', new_column_name='name')
