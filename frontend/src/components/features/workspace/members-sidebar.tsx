"use client";

import { Workspace } from "@/types/workspace.types";
import { useWorkspaceOnlineUsers } from "@/store/message.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Shield, Users } from "lucide-react";

interface MembersSidebarProps {
  workspace: Workspace;
}

export function MembersSidebar({ workspace }: MembersSidebarProps) {
  const onlineUserIds = useWorkspaceOnlineUsers(workspace._id);

  const getInitials = (firstName?: string, email?: string) => {
    if (firstName) return firstName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "?";
  };

  const getRoleIcon = (role: string): React.ReactNode => {
    if (role === "owner")
      return <Crown className="w-3 h-3 text-emerald-400" />;
    if (role === "admin")
      return <Shield className="w-3 h-3 text-lime-400" />;
    return null;
  };

  const sortedMembers = [...workspace.members].sort((a, b) => {
    const aOnline = onlineUserIds.includes(a.user._id);
    const bOnline = onlineUserIds.includes(b.user._id);

    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;

    const roleOrder = { owner: 0, admin: 1, member: 2 };
    return (
      roleOrder[a.role as keyof typeof roleOrder] -
      roleOrder[b.role as keyof typeof roleOrder]
    );
  });

  const onlineCount = sortedMembers.filter((m) =>
    onlineUserIds.includes(m.user._id)
  ).length;

  const offlineMembers = sortedMembers.filter(
    (m) => !onlineUserIds.includes(m.user._id)
  );

  return (
    <aside className="w-64 bg-[#0a0c0b] border-l border-white/[0.06] flex flex-col relative">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-full h-32 bg-emerald-500/[0.03] blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Users className="w-3 h-3 text-emerald-400" />
          </div>
          <h3 className="font-semibold text-white text-sm flex-1">Members</h3>
          <span className="text-xs text-slate-500">
            {onlineCount}/{sortedMembers.length}
          </span>
        </div>
      </div>

      {/* Members List */}
      <div className="relative flex-1 overflow-y-auto p-2">
        {/* Online Section */}
        {onlineCount > 0 && (
          <>
            <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 py-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              Online — {onlineCount}
            </div>

            {sortedMembers
              .filter((m) => onlineUserIds.includes(m.user._id))
              .map((member, idx) => (
                <MemberItem
                  key={member.user._id || `member-online-${idx}`}
                  member={member}
                  isOnline={true}
                  getInitials={getInitials}
                  getRoleIcon={getRoleIcon}
                />
              ))}
          </>
        )}

        {/* Offline Section */}
        {offlineMembers.length > 0 && (
          <>
            <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 py-2 mt-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              Offline — {offlineMembers.length}
            </div>

            {offlineMembers.map((member, idx) => (
              <MemberItem
                key={member.user._id || `member-offline-${idx}`}
                member={member}
                isOnline={false}
                getInitials={getInitials}
                getRoleIcon={getRoleIcon}
              />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}

// ============================================
// Member Item
// ============================================

interface MemberItemProps {
  member: any;
  isOnline: boolean;
  getInitials: (firstName?: string, email?: string) => string;
  getRoleIcon: (role: string) => React.ReactNode;
}

function MemberItem({
  member,
  isOnline,
  getInitials,
  getRoleIcon,
}: MemberItemProps) {
  const displayName =
    member.user.firstName ||
    member.user.email?.split("@")[0] ||
    "Unknown User";

  return (
    <div
      className={`group flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white/[0.03] cursor-pointer transition-colors ${
        !isOnline && "opacity-50"
      }`}
    >
      <div className="relative">
        <Avatar className="w-8 h-8 border border-white/10">
          {member.user.avatar && (
            <AvatarImage src={member.user.avatar} alt={displayName} />
          )}
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-lime-400 text-black text-[10px] font-bold">
            {getInitials(member.user.firstName, member.user.email)}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-lime-400 rounded-full border-2 border-[#0a0c0b]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-white truncate">
            {displayName}
          </p>
          {getRoleIcon(member.role)}
        </div>
        <p className="text-[10px] text-slate-600 truncate">
          {member.user.email}
        </p>
      </div>
    </div>
  );
}