import { AuthenticatedUser } from "../../domain/auth-user";
import { MeResponseDTO } from "../DTO/me-response.dto";

export class MeResultMapper {
    public static toAuthenticatedUser(dto: MeResponseDTO): AuthenticatedUser {
        return {
            id: dto.id,
            name: `${dto.firstName} ${dto.lastName}`,
            email: dto.email,
            roles: [],
        };
    }
}
