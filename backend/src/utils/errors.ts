export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Data tidak ditemukan') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Data tidak valid') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Akses ditolak') {
    super(message, 401);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Data sudah ada') {
    super(message, 409);
  }
}
