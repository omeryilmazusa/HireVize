"""remove tailoring

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-02-26 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop FK and column from applications
    op.drop_constraint('applications_tailored_resume_id_fkey', 'applications', type_='foreignkey')
    op.drop_column('applications', 'tailored_resume_id')

    # Drop tailored_resumes table
    op.drop_table('tailored_resumes')


def downgrade() -> None:
    # Recreate tailored_resumes table
    op.create_table('tailored_resumes',
        sa.Column('job_id', sa.UUID(), nullable=False),
        sa.Column('base_resume_id', sa.UUID(), nullable=False),
        sa.Column('tailored_sections', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('diff_summary', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ai_model_used', sa.String(length=100), nullable=False),
        sa.Column('ai_prompt_tokens', sa.Integer(), nullable=True),
        sa.Column('ai_completion_tokens', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=50), server_default='draft', nullable=False),
        sa.Column('file_path', sa.String(length=1000), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['base_resume_id'], ['resumes.id']),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('job_id', 'base_resume_id', name='uq_tailored_per_job_base'),
    )

    # Re-add FK column to applications
    op.add_column('applications', sa.Column('tailored_resume_id', sa.UUID(), nullable=True))
    op.create_foreign_key('applications_tailored_resume_id_fkey', 'applications', 'tailored_resumes', ['tailored_resume_id'], ['id'])
