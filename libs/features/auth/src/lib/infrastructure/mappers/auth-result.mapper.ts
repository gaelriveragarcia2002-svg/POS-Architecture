import { AuthResult } from "../../domain/auth-result";
import { VerificationResponseDTO } from "../DTO/verification-response.dto";

export class AuthResultMapper {
    public static toAuthResult(dto: VerificationResponseDTO): AuthResult {
        return {
            id: dto.id,
            username: dto.username,
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            gender: dto.gender,
            image: dto.image,
            accessToken: dto.accessToken,
            refreshToken: dto.refreshToken,
        };
    }
}
