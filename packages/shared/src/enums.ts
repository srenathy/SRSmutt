export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  DEVOTEE = 'DEVOTEE'
}

export enum PaymentMode {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  BANK = 'BANK'
}

export enum ReceiptKind {
  NEW_SEVA = 'NEW_SEVA',
  SHASHWATA_SEVA = 'SHASHWATA_SEVA',
  KIND_DONATION = 'KIND_DONATION'
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export enum AnnouncementCategory {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  EVENT = 'EVENT',
  DARSHAN_TIMINGS = 'DARSHAN_TIMINGS',
  GURU_PARAMPARA = 'GURU_PARAMPARA'
}
