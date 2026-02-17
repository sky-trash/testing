export class Option {
  id: number;
  text: string;
  votes: number;

  constructor(id: number, text: string) {
    this.id = id;
    this.text = text;
    this.votes = 0;
  }

  vote(): void {
    this.votes += 1;
  }
}

export class Poll {
  id: number;
  question: string;
  options: Option[];
  isActive: boolean;
  createdAt: Date;
  votedUsers: Set<string>;

  constructor(id: number, question: string, optionsText: string[]) {
    this.id = id;
    this.question = question;
    this.options = optionsText.map(
      (text, index) => new Option(index + 1, text),
    );
    this.isActive = true;
    this.createdAt = new Date();
    this.votedUsers = new Set<string>();
  }

  vote(optionId: number, userId: string): boolean {
    if (!this.isActive) {
      return false;
    }
    if (this.votedUsers.has(userId)) {
      return false;
    }
    const option = this.options.find((opt) => opt.id === optionId);
    if (!option) {
      return false;
    }

    option.vote();
    this.votedUsers.add(userId);
    return true;
  }

  closePoll(): void {
    this.isActive = false;
  }

  getResults(): { optionId: number; text: string; votes: number }[] {
    return this.options.map((opt) => ({
      optionId: opt.id,
      text: opt.text,
      votes: opt.votes,
    }));
  }

  getTotalVotes(): number {
    return this.options.reduce((total, opt) => total + opt.votes, 0);
  }

  getWinner(): { optionId: number; text: string; votes: number } | null {
    if (this.options.length === 0 || this.getTotalVotes() === 0) {
      return null;
    }

    const winner = this.options.reduce((prev, current) =>
      prev.votes > current.votes ? prev : current,
    );

    return {
      optionId: winner.id,
      text: winner.text,
      votes: winner.votes,
    };
  }
}

export class VotingSystem {
  private polls: Poll[] = [];
  private nextPollId: number = 1;

  createPoll(question: string, options: string[]): Poll {
    if (options.length < 2) {
      throw new Error("Опрос должен содержать минимум 2 варианта ответа");
    }

    const poll = new Poll(this.nextPollId++, question, options);
    this.polls.push(poll);
    return poll;
  }

  findPollById(pollId: number): Poll | undefined {
    return this.polls.find((poll) => poll.id === pollId);
  }

  getAllPolls(): Poll[] {
    return [...this.polls];
  }

  getActivePolls(): Poll[] {
    return this.polls.filter((poll) => poll.isActive);
  }

  getClosedPolls(): Poll[] {
    return this.polls.filter((poll) => !poll.isActive);
  }

  deletePoll(pollId: number): boolean {
    const index = this.polls.findIndex((poll) => poll.id === pollId);
    if (index === -1) return false;

    this.polls.splice(index, 1);
    return true;
  }

  voteInPoll(pollId: number, optionId: number, userId: string): boolean {
    const poll = this.findPollById(pollId);
    if (!poll) return false;

    return poll.vote(optionId, userId);
  }

  closePoll(pollId: number): boolean {
    const poll = this.findPollById(pollId);
    if (!poll) return false;

    poll.closePoll();
    return true;
  }
}