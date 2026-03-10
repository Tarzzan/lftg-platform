// @ts-nocheck
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AccountingService } from './accounting.service';

class CreateTransactionDto {
  amount: number;
  type: string;
  description?: string;
  date?: string;
}

@ApiTags('Comptabilité')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('summary')
  @ApiOperation({ summary: "Résumé comptable annuel" })
  @ApiResponse({ status: 200, description: "Résumé comptable" })
  getSummary(@Query('year') year?: string) {
    return this.accountingService.getAccountingSummary(+year || new Date().getFullYear());
  }

  @Get('transactions')
  @ApiOperation({ summary: "Liste des transactions" })
  getTransactions(
    @Query("from") from?: string,
    @Query('to') to?: string,
    @Query('type') type?: string,
  ) {
    return this.accountingService.getTransactions?.({ from, to, type }) ?? [];
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: "Détail d'une transaction" })
  getTransaction(@Param('id') id: string) {
    return this.accountingService.getTransaction?.(id) ?? { id };
  }

  @Post('transactions')
  @ApiOperation({ summary: "Créer une transaction" })
  createTransaction(@Body() dto: CreateTransactionDto) {
    return this.accountingService.createTransaction?.(dto) ?? dto;
  }

  @Get('balance')
  @ApiOperation({ summary: 'Solde comptable actuel' })
  getBalance() {
    return this.accountingService.getBalance?.() ?? { balance: 0 };
  }
}
