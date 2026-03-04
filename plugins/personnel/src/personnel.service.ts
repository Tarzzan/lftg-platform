import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../apps/backend/src/modules/prisma/prisma.service';

@Injectable()
export class PersonnelService {
  constructor(private prisma: PrismaService) {}

  // --- Employees ---
  async findAllEmployees() {
    return this.prisma.employee.findMany({
      include: { skills: true, documents: true, leaves: true },
      orderBy: { id: 'asc' },
    });
  }

  async findEmployeeById(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: { skills: true, documents: true, leaves: true },
    });
    if (!emp) throw new NotFoundException(`Employé ${id} introuvable`);
    return emp;
  }

  async createEmployee(data: any) {
    return this.prisma.employee.create({
      data: {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        department: data.department,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      },
      include: { skills: true },
    });
  }

  async updateEmployee(id: string, data: any) {
    await this.findEmployeeById(id);
    return this.prisma.employee.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.hireDate !== undefined && { hireDate: new Date(data.hireDate) }),
      },
      include: { skills: true, documents: true },
    });
  }

  async deleteEmployee(id: string) {
    await this.findEmployeeById(id);
    await this.prisma.leave.deleteMany({ where: { employeeId: id } });
    await this.prisma.hrDocument.deleteMany({ where: { employeeId: id } });
    await this.prisma.employee.update({
      where: { id },
      data: { skills: { set: [] } },
    });
    await this.prisma.employee.delete({ where: { id } });
    return { deleted: true };
  }

  // --- Skills ---
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

  async createSkill(name: string) {
    return this.prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // --- Leaves (Congés) ---
  async findAllLeaves(employeeId?: string) {
    return this.prisma.leave.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLeave(data: any) {
    return this.prisma.leave.create({
      data: {
        employeeId: data.employeeId,
        type: data.type || 'conge_paye',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
      },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async updateLeave(id: string, data: any) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException(`Congé ${id} introuvable`);
    return this.prisma.leave.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
        ...(data.reason !== undefined && { reason: data.reason }),
      },
    });
  }
}
