import { 
  TrendingUp, 
  Shield, 
  Gift, 
  Target, 
  Landmark, 
  Flame, 
  Heart,
  Star,
  Zap,
  Users,
  CheckCircle,
  Award,
  Sparkles,
  type LucideProps 
} from "lucide-react";

export const Icons = {
  Growth: (props: LucideProps) => <TrendingUp {...props} />,
  Stability: (props: LucideProps) => <Shield {...props} />,
  Rewards: (props: LucideProps) => <Gift {...props} />,
  Mission: (props: LucideProps) => <Target {...props} />,
  Landmark: (props: LucideProps) => <Landmark {...props} />,
  Flame: (props: LucideProps) => <Flame {...props} />,
  Heart: (props: LucideProps) => <Heart {...props} />,
  Star: (props: LucideProps) => <Star {...props} />,
  Zap: (props: LucideProps) => <Zap {...props} />,
  Users: (props: LucideProps) => <Users {...props} />,
  CheckCircle: (props: LucideProps) => <CheckCircle {...props} />,
  Award: (props: LucideProps) => <Award {...props} />,
  Sparkles: (props: LucideProps) => <Sparkles {...props} />,
};
