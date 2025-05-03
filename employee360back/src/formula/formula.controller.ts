import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Get,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { FormulaService } from './formula.service';
import { CreateFormulaDto } from './dto/create-formula.dto';
import { UpdateFormulaDto } from './dto/update-formula.dto';

@Controller('formulas')
export class FormulaController {
  constructor(private readonly formulaService: FormulaService) {}

  @Post()
  async create(@Body() createFormulaDto: CreateFormulaDto) {
    return this.formulaService.create(createFormulaDto);
  }

  @Get()
  async findAll() {
    return this.formulaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formulaService.findOne(id);
  }

  @Get('by-form/:formId')
  async findByForm(@Param('formId', ParseIntPipe) formId: number) {
    return this.formulaService.findByForm(formId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFormulaDto: UpdateFormulaDto,
  ) {
    return this.formulaService.update(id, updateFormulaDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.formulaService.remove(id);
  }
}
