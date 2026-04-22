export class Street {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  update(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }
}

export class StreetManagement {
  private streets: Street[] = [];
  private nextId: number = 1;

  addStreet(name: string): Street {
    if (!name || name.trim().length === 0) {
      throw new Error("Название улицы не может быть пустым");
    }

    const street = new Street(this.nextId++, name.trim());
    this.streets.push(street);
    return street;
  }

  getAllStreets(): Street[] {
    return [...this.streets];
  }

  findStreetById(id: number): Street | undefined {
    return this.streets.find((street) => street.id === id);
  }

  updateStreet(id: number, newName: string): boolean {
    const street = this.findStreetById(id);
    if (!street) return false;

    if (!newName || newName.trim().length === 0) {
      throw new Error("Название улицы не может быть пустым");
    }

    street.update(newName.trim());
    return true;
  }

  deleteStreet(id: number): boolean {
    const index = this.streets.findIndex((street) => street.id === id);
    if (index === -1) return false;

    this.streets.splice(index, 1);
    return true;
  }
}
