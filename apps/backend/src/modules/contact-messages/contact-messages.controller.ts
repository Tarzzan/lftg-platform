// @ts-nocheck
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ContactMessagesService } from "./contact-messages.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@Controller("contact-messages")
export class ContactMessagesController {
  constructor(private readonly service: ContactMessagesService) {}

  // Public: soumettre un message de contact
  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  // Admin: lister les messages
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query("status") status?: string) { return this.service.findAll(status); }

  @Get("stats")
  @UseGuards(JwtAuthGuard)
  getStats() { return this.service.getStats(); }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  findOne(@Param("id") id: string) { return this.service.findOne(id); }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param("id") id: string, @Body("status") status: string) { return this.service.updateStatus(id, status); }

  @Post(":id/reply")
  @UseGuards(JwtAuthGuard)
  reply(@Param("id") id: string, @Body() body: any) { return this.service.reply(id, body); }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  remove(@Param("id") id: string) { return this.service.remove(id); }
}
