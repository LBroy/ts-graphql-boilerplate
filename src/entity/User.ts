import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn
  // OneToMany
} from "typeorm";
import { Profile } from "./Profile";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  firstName: string;

  @Column({ nullable: true })
  profileId: number;

  // @OneToMany(() => Photo, photo => photo.user)
  // photos: Photo[];

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;
}
