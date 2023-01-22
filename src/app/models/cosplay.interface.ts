export class Cosplay {
    constructor(
        public id: string,
        public characterName: string,
        public description: string,
        public series: string,
        public imageUrl: string,
        public creationDate: Date,
        public funds: number,
        public percentComplete: string,
        public status: boolean,
        public userId: string
    ) {}
}