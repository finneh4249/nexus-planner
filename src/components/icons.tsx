import { TrendingUp, Shield, Gift, Target, Landmark, Flame, type LucideProps } from "lucide-react";

export const Icons = {
  Growth: (props: LucideProps) => <TrendingUp {...props} />,
  Stability: (props: LucideProps) => <Shield {...props} />,
  Rewards: (props: LucideProps) => <Gift {...props} />,
  Mission: (props: LucideProps) => <Target {...props} />,
  Landmark: (props: LucideProps) => <Landmark {...props} />,
  Flame: (props: LucideProps) => <Flame {...props} />,
};
