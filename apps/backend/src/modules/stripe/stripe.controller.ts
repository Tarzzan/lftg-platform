import { Controller, Get, Post, Body, Query, Param, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StripeService, CreatePaymentIntentDto, CreateCheckoutSessionDto } from './stripe.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Stripe / Paiements')
@ApiBearerAuth()
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('payment-intent')
  @ApiOperation({ summary: 'Créer une intention de paiement' })
  createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.stripeService.createPaymentIntent(dto);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Créer une session Checkout' })
  createCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
    return this.stripeService.createCheckoutSession(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques de paiement' })
  getPaymentStats(@Query('period') period: 'day' | 'week' | 'month' | 'year') {
    return this.stripeService.getPaymentStats(period || 'month');
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Lister les transactions' })
  listTransactions(
    @Query('limit') limit: string,
    @Query('offset') offset: string,
  ) {
    return this.stripeService.listTransactions(
      parseInt(limit) || 20,
      parseInt(offset) || 0,
    );
  }

  @Post('payment-link/:saleId')
  @ApiOperation({ summary: 'Créer un lien de paiement pour une vente' })
  createPaymentLink(
    @Param('saleId') saleId: string,
    @Body() body: { amount: number; description: string },
  ) {
    return this.stripeService.createPaymentLink(saleId, body.amount, body.description);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Webhook Stripe (public)' })
  handleWebhook(@Body() event: any) {
    return this.stripeService.handleWebhook(event);
  }
}
