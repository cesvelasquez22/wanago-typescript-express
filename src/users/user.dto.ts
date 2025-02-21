import { IsOptional, IsString, ValidateNested } from "class-validator";
import CreateAddressDto from "./address.dto";
import { plainToClass, plainToInstance, Transform, Type } from "class-transformer";

class CreateUserDto {
  @IsString()
  public name: string;

  @IsString()
  public email: string;

  @IsString()
  public password: string;

  @ValidateNested()
  @IsOptional()
  @Transform((value) => plainToInstance(CreateAddressDto, value.value))
  public address?: CreateAddressDto;
}

export default CreateUserDto;
