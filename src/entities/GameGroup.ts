import "reflect-metadata";
import {
	Column,
	Entity,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { GameSession } from "./GameSession";
import { User } from "./User";

@Entity()
export class GameGroup {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	name!: string;

	@Column()
	description!: string;

	@Column({ default: false })
	isActive!: boolean;

	@ManyToMany(() => User, (user) => user.groups)
	members!: User[];

	@ManyToOne(() => User, (user) => user.masterGroups)
	gameMaster!: User;

	@OneToMany(() => GameSession, (session) => session.group)
	sessions!: GameSession[];
}
