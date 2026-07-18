"""initial_schema

Revision ID: 5c4f029fba4a
Revises: 
Create Date: 2026-07-18 10:12:19.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5c4f029fba4a'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        'users',
        sa.Column('firebase_uid', sa.String(length=128), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text("TIMEZONE('utc', NOW())"), nullable=False),
        sa.PrimaryKeyConstraint('firebase_uid')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_firebase_uid'), 'users', ['firebase_uid'], unique=True)

    # 2. Create roles table
    op.create_table(
        'roles',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_roles_name'), 'roles', ['name'], unique=True)

    # 3. Create role_assignments table
    op.create_table(
        'role_assignments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(length=128), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('scope', sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.firebase_uid'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 4. Create files table
    op.create_table(
        'files',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('path', sa.String(length=1024), nullable=False),
        sa.Column('size', sa.Integer(), nullable=False),
        sa.Column('owner_id', sa.String(length=128), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text("TIMEZONE('utc', NOW())"), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text("TIMEZONE('utc', NOW())"), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.firebase_uid'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('files')
    op.drop_table('role_assignments')
    op.drop_index(op.f('ix_roles_name'), table_name='roles')
    op.drop_table('roles')
    op.drop_index(op.f('ix_users_firebase_uid'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
