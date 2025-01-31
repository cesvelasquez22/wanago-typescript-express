import { IsString } from 'class-validator';
 
class CreatePostDto {
  @IsString()
  public author: string | undefined;
 
  @IsString()
  public content: string | undefined;
 
  @IsString()
  public title: string | undefined;
}
 
export default CreatePostDto;
