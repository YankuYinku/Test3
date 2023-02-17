import {FaqTopic} from "@/stores/models/FaqTopic";

export interface FaqGroup {
    id: string,
    title: string,
    slug:string,
    shortTitle: string,
    introText:any, // structure from help_group_intro_text
    topics:FaqTopic[],
}