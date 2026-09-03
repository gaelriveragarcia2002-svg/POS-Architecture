import { AuthRefresh } from "../../domain/auth-refresh";
import { RefreshResponseDTO } from "../DTO/refresh-response.dto";

export class RefreshResultMapper {
    public static toAuthRefresh(dto: RefreshResponseDTO): AuthRefresh {
        return {
            accessToken: dto.accessToken,
            refreshToken: dto.refreshToken,
        };
    }
}
