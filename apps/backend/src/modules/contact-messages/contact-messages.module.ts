import { Module } from "@nestjs/common";
import { ContactMessagesController } from "./contact-messages.controller";
import { ContactMessagesService } from "./contact-messages.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ContactMessagesController],
  providers: [ContactMessagesService],
  exports: [ContactMessagesService],
})
export class ContactMessagesModule {}
