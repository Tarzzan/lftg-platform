import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../apps/backend/src/modules/prisma/prisma.service';

@Injectable()
export class PersonnelService {
  constructor(private prisma: PrismaService) {}

  async findAllEmployees() {
    return this.prisma.employee.findMany({
      include: { skills: true, documents: true },
      orderBy: { id: 'asc' },
    });
  }

  async findEmployeeById(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: { skills: true, documents: true },
    });
    if (!emp) throw new NotFoundException(`Employé ${id} introuvable`);
    return emp;
  }

  async createEmployee(data: { userId: string; jobTitle?: string; department?: string; hireDate?: Date }) {
    return this.prisma.employee.create({ data, include: { skills: true } });
  }

  async updateEmployee(id: string, data: { jobTitle?: string; department?: string }) {
    await this.findEmployeeById(id);
    return this.prisma.employee.update({ where: { id }, data });
  }

  async addSkill(employeeId: string, skillName: string) {
    const skill = await this.prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName },
    });
    return this.prisma.employee.update({
      where: { id: employeeId },
      data: { skills: { connect: { id: skill.id } } },
      include: { skills: true },
    });
  }

  async findAllSkills() {
    return this.prisma.skill.findMany({ orderBy: { name: 'asc' } });
  }
}
