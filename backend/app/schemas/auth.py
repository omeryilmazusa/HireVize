from uuid import UUID

from pydantic import BaseModel


class RegisterRequest(BaseModel):
    email: str
    password: str
    first_name: str = ""
    last_name: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str

    model_config = {"from_attributes": True}


class ExtensionTokenResponse(BaseModel):
    token: str
    expires_in: int
