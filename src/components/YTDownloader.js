import React, { useState, useEffect, Fragment } from "react"
import { Header, Form, Divider, List, Button } from "semantic-ui-react"
import { useLocation, useHistory } from "react-router-dom"
import { useDebounce } from "use-debounce"
import queryString from "query-string"

const initialState = {
  audioAndVideo: [],
  audio: [],
  video: [],
}

const YTDownloader = () => {
  const location = useLocation()
  const { push } = useHistory()

  const [query, setQuery] = useState(queryString.parse(location.search).q || "")
  const [video, setVideo] = useState("")
  const [{ audioAndVideo, audio: audioFormats, video: videoFormats }, setQualities] = useState(initialState)
  const [loading, setLoading] = useState(false)

  const [debouncedUrl] = useDebounce(query, 500)

  useEffect(() => {
    push({ search: queryString.stringify({ q: debouncedUrl }) })
  }, [push, debouncedUrl])

  useEffect(() => {
    const m = query.match(/(?:https?:\/\/www.)?youtu(?:be.com\/watch\?v=|.be\/)([\w-]{11})/)
    if (m) {
      const videoId = m[1]
      setVideo(videoId)
    } else {
      setVideo("")
    }
  }, [query])

  useEffect(() => {
    if (video) {
      setLoading(true)
      fetch(`${process.env.REACT_APP_API_URL}/${video}`).then(res => res.json()).then(res => {
        setQualities({ audioAndVideo: res.audioAndVideo || [], audio: res.audio || [], video: res.video || [] })
        setLoading(false)
      })
    } else {
      setQualities(initialState)
    }
  }, [video])

  const audioAndVideoItems = audioAndVideo.map(q => ({
    key: q.itag,
    header: {
      as: "a",
      content: q.qualityLabel,
      href: `${process.env.REACT_APP_API_URL}/download/${video}/${q.itag}`,
    },
    description: getContentTypeFromMimeType(q.mimeType),
  }))

  const audioItems = audioFormats.map(q => ({
    key: q.itag,
    content: <Fragment>
      <List.Content floated="right">
        <Button circular content="MP3" compact value={q.itag} as="a" href={`${process.env.REACT_APP_API_URL}/${video}/${q.itag}/mp3`} />
      </List.Content>
      <List.Header>
        <a href={`${process.env.REACT_APP_API_URL}/download/${video}/${q.itag}`}>{getContentTypeFromMimeType(q.mimeType)}</a>
      </List.Header>
      <List.Description content={`${getAudioBitrate(q.itag)}k (${q.bitrate})`} />
    </Fragment>,
  }))

  console.log(audioItems)

  const videoItems = videoFormats.map(q => ({
    key: q.itag,
    header: {
      as: "a",
      content: q.qualityLabel,
      href: `${process.env.REACT_APP_API_URL}/download/${video}/${q.itag}`,
    },
    description: getContentTypeFromMimeType(q.mimeType),
  }))

  const showResults = !!audioAndVideoItems.length || !!audioItems.length || !!videoItems.length

  return (
    <>
      <Header as="h1" content="YouTube Downloader" icon={{ name: "youtube", color: "red" }} subheader="A good YouTube downloader in 2020..." />
      <Form>
        <Form.Input label="Url" fluid value={query} onChange={(_e, { value }) => setQuery(value)} placeholder="Enter a url..." loading={loading} />
        {showResults && <Divider />}
        {showResults && <Form.Group widths={3}>
          <Form.Field>
            <Header as="h3" content="Audio & Video Formats" />
            <List items={audioAndVideoItems} />
          </Form.Field>
          <Form.Field>
            <Header as="h3" content="Audio Formats" />
            <List items={audioItems} />
          </Form.Field>
          <Form.Field>
            <Header as="h3" content="Video Formats" />
            <List items={videoItems} />
          </Form.Field>
        </Form.Group>}
      </Form>
    </>
  )
}

const getAudioBitrate = itag => {
  switch (itag) {
    case 139: return 48
    case 140: return 128
    case 141: return 256
    case 171: return 128
    case 249: return 50
    case 250: return 70
    case 251: return 160
    default: return 0
  }
}

const getContentTypeFromMimeType = mimeType => {
  const m = mimeType.match(/\/(\w+);/)
  return m ? m[1] : ""
}

export default YTDownloader