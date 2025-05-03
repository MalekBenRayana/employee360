import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FormResponseValueService } from './form-response-value.service';
import { FormResponseValue } from './form-response-value.entity';

@Controller('form-response-values')
export class FormResponseValueController {
  constructor(
    private readonly formResponseValueService: FormResponseValueService,
  ) {}

  @Post()
  create(@Body() createFormResponseValueDto: Partial<FormResponseValue>) {
    return this.formResponseValueService.create(createFormResponseValueDto);
  }

  @Get()
  findAll() {
    return this.formResponseValueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formResponseValueService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormResponseValueDto: Partial<FormResponseValue>,
  ) {
    return this.formResponseValueService.update(
      +id,
      updateFormResponseValueDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formResponseValueService.remove(+id);
  }
}
