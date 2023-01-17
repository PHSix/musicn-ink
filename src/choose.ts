import names from './names'
import type { CommandOptions, SearchSongInfo, SongInfo } from './types'
import { createElement, FC, useState, useMemo, Fragment } from 'react'
import { Box, render, Text, useApp, useInput } from 'ink'
import figures from 'figures'

const { radioOn, radioOff } = figures

const App: FC<{
  searchSongs: SearchSongInfo[]
  options: CommandOptions
  result: {
    songs: SongInfo[]
  }
}> = (props) => {
  const { options, result } = props
  const { exit } = useApp()

  const [current, setCurrent] = useState(0)
  const [searchSongs, setSearchSongs] = useState<(SearchSongInfo & { selected: boolean })[]>(() => {
    const copyResult = JSON.parse(JSON.stringify(props.searchSongs))
    copyResult.forEach((ele: any) => {
      ele.selected = false
    })

    return copyResult
  })
  const updateCurrent = (offset: number) => {
    const t = (current + offset + searchSongs.length) % searchSongs.length
    setCurrent(t)
  }

  const songOpts = useMemo(() => {
    return searchSongs.map((song, index) => ({
      ...names(song, index, options),
      selected: song.selected,
    }))
  }, [searchSongs, options])

  const onSubmit = () => {
    const selectedSongs = songOpts.filter((song) => song.selected).map((song) => song.value)
    result.songs = selectedSongs as any
    exit()
  }

  useInput((input, key) => {
    if (input === ' ') {
      setSearchSongs((songs) => {
        return songs.map((song, index) => {
          if (index === current) return { ...song, selected: !song.selected }
          return song
        })
      })
    } else if (key.return) {
      onSubmit()
    } else if (key.downArrow) {
      updateCurrent(+1)
    } else if (key.upArrow) {
      updateCurrent(-1)
    }
  })
  return createElement(Box, {
    flexDirection: 'column',
    children: [
      createElement(Text, {
        key: '-1',
        children: '👏🏻请选择歌曲',
        bold: true,
      }),
      createElement(Fragment, {
        key: '0',
        children: songOpts.map((opt, index) => {
          const indicatorColor = current === index || opt.selected ? 'green' : 'white'
          const textColor = current === index ? 'green' : 'white'
          return createElement(Box, {
            key: index,
            children: [
              createElement(Text, {
                key: 1,
                children: (opt.selected ? radioOn : radioOff) + '  ',
                color: indicatorColor,
              }),
              createElement(Text, {
                key: 0,
                color: textColor,
                children: opt.name,
              }),
            ],
          })
        }),
      }),
    ],
  })
}

export const inkChoose: (_: SongInfo) => Promise<{
  songs: SongInfo[]
}> = ({ searchSongs, options }: SongInfo) => {
  return new Promise<{
    songs: SongInfo[]
  }>((resolve) => {
    const result = {
      songs: [] as SongInfo[],
    }
    const { waitUntilExit } = render(
      createElement(App, {
        searchSongs,
        options,
        result,
      })
    )
    waitUntilExit().then(() => setTimeout(() => resolve(result), 100))
  })
}

export default inkChoose
