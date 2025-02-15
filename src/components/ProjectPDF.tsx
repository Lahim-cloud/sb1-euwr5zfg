import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Project } from '../data/projects';

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
});

// Create Document Component
const ProjectDocument = ({ project }: { project: Project }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>{project.name}</Text>
        <Text style={styles.text}>Description: {project.description}</Text>
        <Text style={styles.text}>Status: {project.status}</Text>
        <Text style={styles.text}>Start Date: {project.startDate}</Text>
        <Text style={styles.text}>End Date: {project.endDate}</Text>
        <Text style={styles.text}>Duration: {project.durationInWeeks} weeks</Text>
        <Text style={styles.text}>Price: ${project.price}</Text>
      </View>
    </Page>
  </Document>
);

// Create download button component
export const ProjectPDFDownload = ({ project }: { project: Project }) => (
  <PDFDownloadLink
    document={<ProjectDocument project={project} />}
    fileName={`${project.name.toLowerCase().replace(/\s+/g, '-')}-details.pdf`}
  >
    {({ loading }) => (
      <button
        className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg flex items-center gap-2"
        disabled={loading}
      >
        {loading ? 'Generating PDF...' : 'Print Details'}
      </button>
    )}
  </PDFDownloadLink>
);
