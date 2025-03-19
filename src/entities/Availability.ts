import "reflect-metadata";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Availability {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	startTime!: Date;

	@Column()
	endTime!: Date;

	@Column({ default: true })
	isAvailable!: boolean;

	@ManyToOne(() => User, (user) => user.availabilities)
	user!: User;
}
