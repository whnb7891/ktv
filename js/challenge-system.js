/**
 * Daily Challenge & Event System - 每日挑战与活动系统
 */
class ChallengeSystem {
  constructor() {
    this.challenges = [
      {
        id: 'daily_easy',
        type: 'daily',
        title: '每日简单挑战',
        description: '在简单难度下获得 80% 以上的准度',
        reward: 500,
        target: { accuracy: 80, difficulty: 'Easy' },
        icon: '⭐'
      },
      {
        id: 'daily_combo',
        type: 'daily',
        title: '连击挑战',
        description: '达成 50 连击',
        reward: 1000,
        target: { combo: 50 },
        icon: '🔥'
      },
      {
        id: 'daily_score',
        type: 'daily',
        title: '高分挑战',
        description: '单曲得分超过 30000',
        reward: 2000,
        target: { score: 30000 },
        icon: '💎'
      },
      {
        id: 'weekly_master',
        type: 'weekly',
        title: '周末大师赛',
        description: '通关所有困难难度曲目',
        reward: 5000,
        target: { allHard: true },
        icon: '👑'
      },
      {
        id: 'monthly_grind',
        type: 'monthly',
        title: '月度磨练',
        description: '累计游玩 100 分钟',
        reward: 10000,
        target: { playtime: 6000 },
        icon: '🎖️'
      }
    ];

    this.events = [
      {
        id: 'summer_festival',
        name: '夏日音乐节',
        startDate: '2026-07-28',
        endDate: '2026-08-10',
        description: '限时活动：新增 10 首限定曲目',
        reward: 'exclusive_songs',
        icon: '🎪'
      },
      {
        id: 'anniversary',
        name: '周年庆典',
        startDate: '2026-08-15',
        endDate: '2026-08-31',
        description: '全服活动：登录送双倍经验',
        reward: 'double_exp',
        icon: '🎉'
      },
      {
        id: 'new_player',
        name: '新手礼包',
        startDate: '2026-07-01',
        endDate: '2026-12-31',
        description: '新玩家专属：前 7 天送精选皮肤',
        reward: 'starter_pack',
        icon: '🎁'
      }
    ];

    this.completedChallenges = this.loadCompletedChallenges();
  }

  /**
   * 获取所有可用挑战
   */
  getAvailableChallenges() {
    const today = new Date().toISOString().split('T')[0];
    return this.challenges.map(challenge => ({
      ...challenge,
      completed: this.isChallengCompleted(challenge.id),
      resetTime: this.getResetTime(challenge.type)
    }));
  }

  /**
   * 获取活动列表
   */
  getActiveEvents() {
    const today = new Date();
    return this.events.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      return today >= start && today <= end;
    });
  }

  /**
   * 检查挑战是否完成
   */
  isChallengCompleted(challengeId) {
    const challenge = this.completedChallenges.find(c => c.id === challengeId);
    return challenge && this.isStillValid(challenge.completedDate, challenge.type);
  }

  /**
   * 检查完成日期是否仍然有效
   */
  isStillValid(completedDate, type) {
    const completed = new Date(completedDate);
    const now = new Date();

    switch (type) {
      case 'daily':
        return completed.toDateString() === now.toDateString();
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return completed >= weekStart;
      case 'monthly':
        return completed.getMonth() === now.getMonth() && 
               completed.getFullYear() === now.getFullYear();
      default:
        return false;
    }
  }

  /**
   * 完成挑战
   */
  completeChallenge(challengeId, playerStats) {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge) return false;

    // 检查是否满足条件
    if (this.checkCondition(challenge.target, playerStats)) {
      this.completedChallenges.push({
        id: challengeId,
        type: challenge.type,
        completedDate: new Date().toISOString(),
        reward: challenge.reward
      });

      this.saveCompletedChallenges();
      console.log(`✓ 完成挑战: ${challenge.title} - 获得 ${challenge.reward} 金币`);
      return { success: true, reward: challenge.reward };
    }

    return { success: false };
  }

  /**
   * 检查条件
   */
  checkCondition(target, stats) {
    if (target.accuracy !== undefined && stats.accuracy < target.accuracy) return false;
    if (target.combo !== undefined && stats.combo < target.combo) return false;
    if (target.score !== undefined && stats.score < target.score) return false;
    if (target.difficulty !== undefined && stats.difficulty !== target.difficulty) return false;
    if (target.allHard !== undefined && !stats.allHardPassed) return false;
    if (target.playtime !== undefined && stats.playtime < target.playtime) return false;
    return true;
  }

  /**
   * 获取重置时间
   */
  getResetTime(type) {
    const now = new Date();
    
    switch (type) {
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
      case 'weekly':
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
        nextMonday.setHours(0, 0, 0, 0);
        return nextMonday;
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(0, 0, 0, 0);
        return nextMonth;
      default:
        return now;
    }
  }

  /**
   * 获取活动奖励
   */
  getEventReward(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return null;

    // 模拟不同活动的奖励
    const rewards = {
      exclusive_songs: { type: 'songs', count: 10, name: '限定曲包' },
      double_exp: { type: 'buff', duration: 24, name: '双倍经验' },
      starter_pack: { type: 'bundle', items: ['skin', 'coins', 'gems'], name: '新手礼包' }
    };

    return rewards[event.reward];
  }

  /**
   * 本地存储
   */
  saveCompletedChallenges() {
    localStorage.setItem('completedChallenges', JSON.stringify(this.completedChallenges));
  }

  loadCompletedChallenges() {
    const saved = localStorage.getItem('completedChallenges');
    return saved ? JSON.parse(saved) : [];
  }
}

export default ChallengeSystem;
