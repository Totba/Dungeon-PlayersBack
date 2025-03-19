import bcrypt from "bcrypt";
import "reflect-metadata";
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Availability } from "./Availability";
import { GameGroup } from "./GameGroup";

export enum UserRole {
	PLAYER = "player",
	GAME_MASTER = "game_master",
	TESTER = "tester",
}

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	email!: string;

	@Column()
	password!: string;

	@Column()
	username!: string;

	@Column({
		type: "enum",
		enum: UserRole,
		default: UserRole.PLAYER,
	})
	role!: UserRole;

	@OneToMany(() => Availability, (availability) => availability.user)
	availabilities!: Availability[];

	@ManyToMany(() => GameGroup, (group) => group.members)
	@JoinTable()
	groups!: GameGroup[];

	@OneToMany(() => GameGroup, (group) => group.gameMaster)
	masterGroups!: GameGroup[];

	async hashPassword() {
		this.password = await bcrypt.hash(this.password, 10);
	}

	async comparePassword(plainPassword: string): Promise<boolean> {
		return bcrypt.compare(plainPassword, this.password);
	}
}
