// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface EmployeeProfile {
  id: string;
  userId: string;
  matricule: string;
  poste: string;
  departement: string;
  dateEmbauche: Date;
  typeContrat: 'CDI' | 'CDD' | 'STAGE' | 'ALTERNANCE';
  salaireBase?: number;
  competences: string[];
  certifications: string[];
  responsableId?: string;
  telephone?: string;
  adresse?: string;
  situationFamiliale?: string;
  nombreEnfants?: number;
  congesAnnuels: number;
  congesPris: number;
  congesRestants: number;
  heuresSup: number;
}

export interface GuardShift {
  id: string;
  employeeId: string;
  date: Date;
  heureDebut: string;
  heureFin: string;
  type: 'MATIN' | 'APRES_MIDI' | 'NUIT' | 'WEEKEND' | 'FERIE';
  zone: string;
  statut: 'PLANIFIE' | 'CONFIRME' | 'EFFECTUE' | 'ABSENT';
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'CONGE_PAYE' | 'RTT' | 'MALADIE' | 'MATERNITE' | 'FORMATION' | 'AUTRE';
  dateDebut: Date;
  dateFin: Date;
  nombreJours: number;
  motif?: string;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE' | 'ANNULE';
  approbateurId?: string;
  commentaire?: string;
}

@Injectable()
export class PersonnelService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  // ── Fiches employés ──────────────────────────────────────────────────────

  async getEmployees(filters?: {
    departement?: string;
    poste?: string;
    typeContrat?: string;
    search?: string;
  }) {
    // Simulation avec données enrichies
    const employees: EmployeeProfile[] = [
      {
        id: 'emp-001',
        userId: 'user-001',
        matricule: 'LFTG-001',
        poste: 'Directeur de la ferme',
        departement: 'Direction',
        dateEmbauche: new Date('2018-03-01'),
        typeContrat: 'CDI',
        salaireBase: 4500,
        competences: ['Management', 'Herpétologie', 'Ornithologie', 'CITES'],
        certifications: ['Certificat de capacité', 'CITES Expert'],
        congesAnnuels: 25,
        congesPris: 8,
        congesRestants: 17,
        heuresSup: 12,
        telephone: '+594 694 123 456',
      },
      {
        id: 'emp-002',
        userId: 'user-002',
        matricule: 'LFTG-002',
        poste: 'Soigneur principal',
        departement: 'Soins',
        dateEmbauche: new Date('2020-06-15'),
        typeContrat: 'CDI',
        salaireBase: 2800,
        competences: ['Soins reptiles', 'Soins oiseaux', 'Premiers secours animaux'],
        certifications: ['Certificat de capacité', 'Formation premiers secours'],
        responsableId: 'emp-001',
        congesAnnuels: 25,
        congesPris: 12,
        congesRestants: 13,
        heuresSup: 8,
        telephone: '+594 694 234 567',
      },
      {
        id: 'emp-003',
        userId: 'user-003',
        matricule: 'LFTG-003',
        poste: 'Vétérinaire',
        departement: 'Médical',
        dateEmbauche: new Date('2021-01-10'),
        typeContrat: 'CDI',
        salaireBase: 5200,
        competences: ['Chirurgie', 'Anesthésie', 'Herpétologie médicale', 'Ornithologie médicale'],
        certifications: ['Doctorat vétérinaire', 'Spécialisation NAC'],
        responsableId: 'emp-001',
        congesAnnuels: 25,
        congesPris: 5,
        congesRestants: 20,
        heuresSup: 0,
        telephone: '+594 694 345 678',
      },
      {
        id: 'emp-004',
        userId: 'user-004',
        matricule: 'LFTG-004',
        poste: 'Gestionnaire stock',
        departement: 'Logistique',
        dateEmbauche: new Date('2022-03-01'),
        typeContrat: 'CDI',
        salaireBase: 2400,
        competences: ['Gestion des stocks', 'Commandes fournisseurs', 'Logistique'],
        certifications: ['BTS Logistique'],
        responsableId: 'emp-001',
        congesAnnuels: 25,
        congesPris: 15,
        congesRestants: 10,
        heuresSup: 3,
        telephone: '+594 694 456 789',
      },
      {
        id: 'emp-005',
        userId: 'user-005',
        matricule: 'LFTG-005',
        poste: 'Soigneur',
        departement: 'Soins',
        dateEmbauche: new Date('2023-09-01'),
        typeContrat: 'CDD',
        salaireBase: 2200,
        competences: ['Soins amphibiens', 'Alimentation', 'Nettoyage enclos'],
        certifications: ['Formation interne LFTG'],
        responsableId: 'emp-002',
        congesAnnuels: 25,
        congesPris: 3,
        congesRestants: 22,
        heuresSup: 0,
        telephone: '+594 694 567 890',
      },
    ];

    let result = employees;
    if (filters?.departement) result = result.filter(e => e.departement === filters.departement);
    if (filters?.typeContrat) result = result.filter(e => e.typeContrat === filters.typeContrat);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e =>
        e.poste.toLowerCase().includes(q) ||
        e.matricule.toLowerCase().includes(q) ||
        e.competences.some(c => c.toLowerCase().includes(q))
      );
    }
    return result;
  }

  async getEmployee(id: string): Promise<EmployeeProfile | null> {
    const employees = await this.getEmployees();
    return employees.find(e => e.id === id) || null;
  }

  async createEmployee(data: Partial<EmployeeProfile>) {
    await this.audit.log({
      action: 'CREATE',
      entity: 'Employee',
      entityId: 'new',
      details: data,
    });
    return { id: `emp-${Date.now()}`, ...data };
  }

  async updateEmployee(id: string, data: Partial<EmployeeProfile>) {
    await this.audit.log({
      action: 'UPDATE',
      entity: 'Employee',
      entityId: id,
      details: data,
    });
    return { id, ...data };
  }

  // ── Planning des gardes ──────────────────────────────────────────────────

  async getGuardSchedule(month: number, year: number): Promise<GuardShift[]> {
    const shifts: GuardShift[] = [
      { id: 'shift-001', employeeId: 'emp-002', date: new Date(`${year}-${String(month).padStart(2,'0')}-01`), heureDebut: '07:00', heureFin: '15:00', type: 'MATIN', zone: 'Volière A + B', statut: 'CONFIRME' },
      { id: 'shift-002', employeeId: 'emp-005', date: new Date(`${year}-${String(month).padStart(2,'0')}-01`), heureDebut: '13:00', heureFin: '21:00', type: 'APRES_MIDI', zone: 'Reptilarium', statut: 'CONFIRME' },
      { id: 'shift-003', employeeId: 'emp-002', date: new Date(`${year}-${String(month).padStart(2,'0')}-03`), heureDebut: '07:00', heureFin: '15:00', type: 'WEEKEND', zone: 'Toutes zones', statut: 'PLANIFIE' },
      { id: 'shift-004', employeeId: 'emp-005', date: new Date(`${year}-${String(month).padStart(2,'0')}-03`), heureDebut: '15:00', heureFin: '21:00', type: 'WEEKEND', zone: 'Toutes zones', statut: 'PLANIFIE' },
      { id: 'shift-005', employeeId: 'emp-003', date: new Date(`${year}-${String(month).padStart(2,'0')}-07`), heureDebut: '09:00', heureFin: '17:00', type: 'MATIN', zone: 'Infirmerie', statut: 'CONFIRME' },
    ];
    return shifts;
  }

  async createGuardShift(data: Partial<GuardShift>) {
    return { id: `shift-${Date.now()}`, ...data };
  }

  // ── Congés ───────────────────────────────────────────────────────────────

  async getLeaveRequests(filters?: { employeeId?: string; statut?: string }): Promise<LeaveRequest[]> {
    const requests: LeaveRequest[] = [
      { id: 'leave-001', employeeId: 'emp-002', type: 'CONGE_PAYE', dateDebut: new Date('2026-04-07'), dateFin: new Date('2026-04-18'), nombreJours: 10, motif: 'Vacances Pâques', statut: 'APPROUVE', approbateurId: 'emp-001' },
      { id: 'leave-002', employeeId: 'emp-004', type: 'RTT', dateDebut: new Date('2026-03-15'), dateFin: new Date('2026-03-15'), nombreJours: 1, statut: 'EN_ATTENTE' },
      { id: 'leave-003', employeeId: 'emp-005', type: 'FORMATION', dateDebut: new Date('2026-03-20'), dateFin: new Date('2026-03-22'), nombreJours: 3, motif: 'Formation premiers secours animaux', statut: 'APPROUVE', approbateurId: 'emp-001' },
      { id: 'leave-004', employeeId: 'emp-003', type: 'CONGE_PAYE', dateDebut: new Date('2026-05-04'), dateFin: new Date('2026-05-08'), nombreJours: 5, motif: 'Congé annuel', statut: 'EN_ATTENTE' },
    ];

    let result = requests;
    if (filters?.employeeId) result = result.filter(r => r.employeeId === filters.employeeId);
    if (filters?.statut) result = result.filter(r => r.statut === filters.statut);
    return result;
  }

  async createLeaveRequest(data: Partial<LeaveRequest>) {
    await this.audit.log({
      action: 'CREATE',
      entity: 'LeaveRequest',
      entityId: 'new',
      details: data,
    });
    return { id: `leave-${Date.now()}`, statut: 'EN_ATTENTE', ...data };
  }

  async approveLeaveRequest(id: string, approbateurId: string) {
    await this.audit.log({
      action: 'UPDATE',
      entity: 'LeaveRequest',
      entityId: id,
      details: { statut: 'APPROUVE', approbateurId },
    });
    return { id, statut: 'APPROUVE', approbateurId };
  }

  async refuseLeaveRequest(id: string, commentaire: string) {
    await this.audit.log({
      action: 'UPDATE',
      entity: 'LeaveRequest',
      entityId: id,
      details: { statut: 'REFUSE', commentaire },
    });
    return { id, statut: 'REFUSE', commentaire };
  }

  // ── Statistiques RH ──────────────────────────────────────────────────────

  async getHRStats() {
    return {
      totalEmployees: 5,
      byDepartement: { Direction: 1, Soins: 2, Médical: 1, Logistique: 1 },
      byContrat: { CDI: 4, CDD: 1 },
      congesEnAttente: 2,
      heuresSupTotal: 23,
      tauxPresence: 94.5,
      formationsEnCours: 1,
    };
  }
}
