export interface SliderItem {
  name: string
  value: string
  logo?: string
  img?: string
  icon?: string
  gradient?: string
  filterKey?: string
  isBoolean?: boolean
}

export interface SliderConfig {
  items: SliderItem[]
  title: string
  defaultFilterKey: string
}
