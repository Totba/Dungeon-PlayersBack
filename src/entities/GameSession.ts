import "reflect-metadata";
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { GameGroup } from "./GameGroup";

@Entity()
export class GameSession {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	title!: string;

	@Column({ nullable: true })
	description!: string;

	@Column()
	sessionDate!: Date;

	@Column()
	duration!: number; // en minutes

	@CreateDateColumn()
	createdAt!: Date;

	@ManyToOne(() => GameGroup, (group) => group.sessions)
	group!: GameGroup;
}
