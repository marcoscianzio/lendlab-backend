import {
  Arg,
  Int,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import {createQueryBuilder, getRepository} from "typeorm";
import {Lend} from "../../entity/lend";
import {LendInput} from "../../inputs/lend/lend.input";
import {LendUpdateInput} from "../../inputs/lend/lend.update.input";

@Resolver()
export class LendResolver {
  @Query(() => String)
  async hello() {
    return "hello";
  }

  @Query(() => [Lend])
  async lend() {
    const lend = await getRepository(Lend)
      .createQueryBuilder("lend")
      .innerJoinAndSelect("lend.reservation", "reservation")
      .innerJoinAndSelect("reservation.material", "material")
      .innerJoinAndSelect("reservation.user", "user")
      .getMany();

    // SELECT * from lend JOIN reservation on lend.reservationIdReserva = reservation.id_reserva JOIN user ON user.cedula = reservation.userCedula
    return lend;
  }

  @Query(() => Int)
  async getLendsCount() {
    const {count} = await createQueryBuilder("lend")
      .select("COUNT(*)", "count")
      .getRawOne();

    return count;
  }

  @Subscription({topics: "CREATE_LEND"})
  newLendSubscription(@Root() payload: Lend): Lend {
    return payload;
  }

  @Mutation(() => Lend)
  async createLend(
    @Arg("data", () => LendInput) data: LendInput,
    @PubSub() pubsub: PubSubEngine
  ): Promise<Lend> {
    const lend = Lend.create({...data}).save();
    pubsub.publish("CREATE_LEND", lend);
    return lend;
  }

  @Mutation(() => Lend)
  async updateLend(
    @Arg("id_lend", () => Int) id_lend: number,
    @Arg("data", () => LendUpdateInput) data: LendUpdateInput
  ) {
    const lend = await Lend.update({id_lend}, data);
    return lend;
  }

  @Mutation(() => Boolean)
  async deleteLend(
    @Arg("id_lend", () => Int) id_lend: number,
    @Arg("fecha_hora_presta", () => String) fecha_hora_presta: string
  ): Promise<Boolean> {
    await Lend.delete({id_lend, fecha_hora_presta});
    return true;
  }
}
