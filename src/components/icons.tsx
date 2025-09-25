import { TrendingUp, Shield, Gift, type LucideProps } from "lucide-react";

export const Icons = {
  Growth: (props: LucideProps) => <TrendingUp {...props} />,
  Stability: (props: LucideProps) => <Shield {...props} />,
  Rewards: (props: LucideProps) => <Gift {...props} />,
};
