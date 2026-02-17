"""Initial schema: users, whatsapp_accounts, webhook_logs, conversation_configs, leads, conversations, messages, notifications

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00

"""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("role", sa.Enum("user", "admin", name="userrole"), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "whatsapp_accounts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("phone_number_id", sa.String(64), nullable=False),
        sa.Column("phone_number", sa.String(32), nullable=False),
        sa.Column("access_token", sa.Text(), nullable=False),
        sa.Column("business_account_id", sa.String(64), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
    )
    op.create_index("ix_whatsapp_accounts_user_id", "whatsapp_accounts", ["user_id"], unique=False)

    op.create_table(
        "webhook_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, primary_key=True),
        sa.Column("payload", sa.Text(), nullable=True),
        sa.Column("direction", sa.String(16), nullable=True),
        sa.Column("phone_number_id", sa.String(64), nullable=True),
        sa.Column("status", sa.String(32), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
    )
    op.create_index("ix_webhook_logs_phone_number_id", "webhook_logs", ["phone_number_id"], unique=False)

    op.create_table(
        "conversation_configs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("msg_new", sa.Text(), nullable=True),
        sa.Column("msg_ask_name", sa.Text(), nullable=True),
        sa.Column("msg_ask_requirement", sa.Text(), nullable=True),
        sa.Column("msg_ask_contact", sa.Text(), nullable=True),
        sa.Column("msg_done", sa.Text(), nullable=True),
        sa.Column("ai_fallback_new", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("ai_fallback_ask_name", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("ai_fallback_ask_requirement", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("ai_fallback_ask_contact", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("ai_fallback_done", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
    )
    op.create_index("ix_conversation_configs_user_id", "conversation_configs", ["user_id"], unique=True)

    op.create_table(
        "conversations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("wa_phone", sa.String(32), nullable=False),
        sa.Column("current_stage", sa.String(32), nullable=False, server_default="NEW"),
        sa.Column("is_complete", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
    )
    op.create_index("ix_conversations_user_id", "conversations", ["user_id"], unique=False)
    op.create_index("ix_conversations_wa_phone", "conversations", ["wa_phone"], unique=False)

    op.create_table(
        "messages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("conversation_id", sa.String(36), sa.ForeignKey("conversations.id"), nullable=False),
        sa.Column("direction", sa.String(16), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
    )
    op.create_index("ix_messages_conversation_id", "messages", ["conversation_id"], unique=False)

    op.create_table(
        "leads",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("conversation_id", sa.String(36), sa.ForeignKey("conversations.id"), nullable=True),
        sa.Column("wa_phone", sa.String(32), nullable=False),
        sa.Column("name", sa.String(255), nullable=True),
        sa.Column("requirement", sa.Text(), nullable=True),
        sa.Column("contact_info", sa.String(255), nullable=True),
        sa.Column("status", sa.Enum("New", "Contacted", "Interested", "Closed", name="leadstatus"), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
    )
    op.create_index("ix_leads_user_id", "leads", ["user_id"], unique=False)
    op.create_index("ix_leads_wa_phone", "leads", ["wa_phone"], unique=False)

    op.create_table(
        "notifications",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("lead_id", sa.String(36), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"], unique=False)


def downgrade():
    op.drop_table("notifications")
    op.drop_table("leads")
    op.drop_table("messages")
    op.drop_table("conversations")
    op.drop_table("conversation_configs")
    op.drop_table("webhook_logs")
    op.drop_table("whatsapp_accounts")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS leadstatus")
    op.execute("DROP TYPE IF EXISTS userrole")
