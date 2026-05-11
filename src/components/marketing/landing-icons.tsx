import type { IconBaseProps, IconType } from "react-icons";
import {
  FaArrowDown,
  FaArrowRight,
  FaArrowUp,
  FaBolt,
  FaChartLine,
  FaCheck,
  FaColumns,
  FaGithub,
  FaGlobe,
  FaGraduationCap,
  FaHourglassHalf,
  FaLandmark,
  FaLanguage,
  FaLaptopCode,
  FaLeaf,
  FaLock,
  FaMountain,
  FaPlus,
  FaRegCalendarAlt,
  FaRegCommentDots,
  FaRegEdit,
  FaStar,
  FaThumbsUp,
  FaTrophy,
  FaWrench,
} from "react-icons/fa";

type IconProps = IconBaseProps & { size?: number };

function ReactIcon(Icon: IconType, size: number, props: IconProps) {
  return <Icon aria-hidden size={size} {...props} />;
}

export function IconMaple({ size = 22, ...p }: IconProps) {
  return ReactIcon(FaLeaf, size, p);
}

export function IconLanguages({ size = 20, ...p }: IconProps) {
  return ReactIcon(FaLanguage, size, p);
}

export function IconChart({ size = 20, ...p }: IconProps) {
  return ReactIcon(FaChartLine, size, p);
}

export function IconLaptop({ size = 20, ...p }: IconProps) {
  return ReactIcon(FaLaptopCode, size, p);
}

export function IconGlobe({ size = 20, ...p }: IconProps) {
  return ReactIcon(FaGlobe, size, p);
}

export function IconLandmark({ size = 20, ...p }: IconProps) {
  return ReactIcon(FaLandmark, size, p);
}

export function IconPlus({ size = 20, ...p }: IconProps) {
  return ReactIcon(FaPlus, size, p);
}

export function IconStar({ size = 18, ...p }: IconProps) {
  return ReactIcon(FaStar, size, p);
}

export function IconMessage({ size = 20, ...p }: IconProps) {
  return ReactIcon(FaRegCommentDots, size, p);
}

export function IconThumbsUp({ size = 20, ...p }: IconProps) {
  return ReactIcon(FaThumbsUp, size, p);
}

export function IconWrench({ size = 20, ...p }: IconProps) {
  return ReactIcon(FaWrench, size, p);
}

export function IconHourglass({ size = 18, ...p }: IconProps) {
  return ReactIcon(FaHourglassHalf, size, p);
}

export function IconCheck({ size = 16, ...p }: IconProps) {
  return ReactIcon(FaCheck, size, p);
}

export function IconGitHub({ size = 16, ...p }: IconProps) {
  return ReactIcon(FaGithub, size, p);
}

export function IconLock({ size = 14, ...p }: IconProps) {
  return ReactIcon(FaLock, size, p);
}

export function IconArrowRight({ size = 14, ...p }: IconProps) {
  return ReactIcon(FaArrowRight, size, p);
}

export function IconArrowDown({ size = 14, ...p }: IconProps) {
  return ReactIcon(FaArrowDown, size, p);
}

export function IconArrowUp({ size = 12, ...p }: IconProps) {
  return ReactIcon(FaArrowUp, size, p);
}

export function IconBolt({ size = 16, ...p }: IconProps) {
  return ReactIcon(FaBolt, size, p);
}

export function IconDashboard({ size = 16, ...p }: IconProps) {
  return ReactIcon(FaColumns, size, p);
}

export function IconEdit({ size = 16, ...p }: IconProps) {
  return ReactIcon(FaRegEdit, size, p);
}

export function IconCalendar({ size = 16, ...p }: IconProps) {
  return ReactIcon(FaRegCalendarAlt, size, p);
}

export function IconGraduation({ size = 16, ...p }: IconProps) {
  return ReactIcon(FaGraduationCap, size, p);
}

export function IconMountain({ size = 16, ...p }: IconProps) {
  return ReactIcon(FaMountain, size, p);
}

export function IconTrophy({ size = 16, ...p }: IconProps) {
  return ReactIcon(FaTrophy, size, p);
}
