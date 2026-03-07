export interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  status: string;
  token: string;
  created_at: string;
  expires_at: string;
}

export interface MemberStats {
  user_id: string;
  first_name: string;
  last_name: string;
  total_applications: number;
  this_week: number;
  response_rate: number;
}

export interface TeamDashboardStats {
  team_name: string;
  member_count: number;
  total_applications: number;
  this_week: number;
  response_rate: number;
  per_member: MemberStats[];
}
