import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(dto.password, 10);

    // Role is never read from the request: everyone who registers is a PATRON
    // (the schema default). Librarians are created through the seed script.
    const user = await this.prisma.user.create({
      data: { name: dto.name, email, password: hash },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    // Same message for "no such user" and "wrong password" so attackers
    // can't tell which emails are registered.
    const ok = user && (await bcrypt.compare(dto.password, user.password));
    if (!user || !ok) throw new UnauthorizedException('Invalid credentials');

    const access_token = this.jwt.sign({ sub: user.id, role: user.role });
    return {
      access_token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
}
