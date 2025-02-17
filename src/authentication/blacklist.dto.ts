import { IsString } from "class-validator";

class BlacklistDto {
    @IsString()
    public token: string;
}

export default BlacklistDto;